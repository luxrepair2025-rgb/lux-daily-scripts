#!/usr/bin/env python3
"""Merge Script-filmed checks from ntfy into counts.json; commit/push if changed. Idempotent."""
import json, os, subprocess, urllib.request
os.chdir(os.path.dirname(os.path.abspath(__file__)))
T = 'https://ntfy.sh/lux-ds-5ee480669bb99dd3/json?poll=1&since=all'
evs = []
for l in urllib.request.urlopen(T, timeout=30).read().decode().splitlines():
    try:
        m = json.loads(l)
        if m.get('event') == 'message':
            e = json.loads(m['message'])
            if e.get('k') == 's' and e.get('d') and e.get('s'): evs.append(e)
    except Exception: pass
state = {}
for e in sorted(evs, key=lambda e: e.get('t', 0)): state[(e['d'], str(e['s']))] = bool(e.get('v'))
try: c = json.load(open('counts.json'))
except Exception: c = {'stocks': {}}
st = c.setdefault('stocks', {})
for (d, s), v in state.items():
    dates = set(st.get(s, {}).get('dates', []))
    dates.add(d) if v else dates.discard(d)  # last state seen for that day wins
    if dates: st[s] = {'total': len(dates), 'dates': sorted(dates)}
    else: st.pop(s, None)
new = json.dumps({'stocks': dict(sorted(st.items()))}, indent=1, sort_keys=True) + '\n'
old = open('counts.json').read() if os.path.exists('counts.json') else ''
if new != old:
    open('counts.json', 'w').write(new)
    subprocess.run(['git', 'add', 'counts.json'], check=True)
    subprocess.run(['git', 'commit', '-qm', 'Update video counts'], check=True)
    subprocess.run(['git', 'pull', '-q', '--rebase'], check=True)
    subprocess.run(['git', 'push', '-q'], check=True)
    print('counts.json updated and pushed')
else: print('no change')
