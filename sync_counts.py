#!/usr/bin/env python3
"""Merge ntfy events into state.json (current Script/B-roll checks per stock + Posted history);
commit/push only if changed. Idempotent: latest timestamp wins per stock/kind, Posted deduped by event id."""
import json, os, subprocess, urllib.request
os.chdir(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://ntfy.sh/lux-ds-5ee480669bb99dd3/json?poll=1&since=all'
subprocess.run(['git', 'pull', '-q', '--rebase'], check=False)
evs = []
for l in urllib.request.urlopen(URL, timeout=30).read().decode().splitlines():
    try:
        m = json.loads(l)
        if m.get('event') != 'message': continue
        e = json.loads(m['message'])
        if e.get('id') and e.get('s') and e.get('k') in ('s', 'b', 'p') and isinstance(e.get('t'), (int, float)): evs.append(e)
    except Exception: pass
try: st = json.load(open('state.json'))
except Exception: st = {}
checks, posted = st.get('checks', {}), st.get('posted', {})
# migrate legacy counts.json (Script-tick based; verified empty at migration time)
if os.path.exists('counts.json'):
    for s, v in json.load(open('counts.json')).get('stocks', {}).items():
        for d in v.get('dates', []):
            i = f'legacy-{s}-{d}'
            if not any(x['id'] == i for x in posted.get(s, [])): posted.setdefault(s, []).append({'id': i, 't': 0, 'date': d})
seen = {x['id'] for a in posted.values() for x in a}
def put(s, k, v, t):
    c = checks.setdefault(s, {})
    if k not in c or c[k]['t'] < t: c[k] = {'v': v, 't': t}
for e in sorted(evs, key=lambda e: e['t']):
    s = str(e['s'])
    if e['k'] in ('s', 'b'): put(s, e['k'], 1 if e.get('v') else 0, e['t'])
    else:
        if e['id'] not in seen:
            seen.add(e['id']); posted.setdefault(s, []).append({'id': e['id'], 't': e['t'], 'date': e.get('date')})
        put(s, 's', 0, e['t']); put(s, 'b', 0, e['t'])
for a in posted.values(): a.sort(key=lambda x: (x['t'], x['id']))
new = json.dumps({'checks': checks, 'posted': posted}, indent=1, sort_keys=True) + '\n'
old = open('state.json').read() if os.path.exists('state.json') else ''
files = []
if new != old: open('state.json', 'w').write(new); files.append('state.json')
if os.path.exists('counts.json'): os.remove('counts.json'); files.append('counts.json')
if files:
    subprocess.run(['git', 'add', '-A', *files], check=True)
    subprocess.run(['git', 'commit', '-qm', 'Sync video state'], check=True)
    subprocess.run(['git', 'push', '-q'], check=True)
    print('state.json updated and pushed')
else: print('no change')
