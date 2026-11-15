import { describe, expect, it } from 'vitest';
import { appReducer, initialState, parseState } from './state';

describe('shared persistence contract', () => {
  it('restores serialized feature data without changing another module', () => {
    const state = appReducer(initialState, { type: 'SET_SLICE', key: 'projects', value: [{ id: 'p1' }] });
    const next = appReducer(state, { type: 'SET_SLICE', key: 'session', value: { userId: 'u1' } });
    expect(parseState(JSON.stringify(next))).toEqual(next);
    expect(state.data).toEqual({ projects: [{ id: 'p1' }] });
    expect(appReducer(next, { type: 'REMOVE_SLICE', key: 'session' })).toEqual(state);
  });

  it('starts empty and rejects malformed or unsupported saved data', () => {
    expect(parseState(null)).toEqual(initialState);
    for (const raw of ['invalid', 'null', '{"version":2,"data":{}}', '{"version":1,"data":[]}']) {
      expect(() => parseState(raw)).toThrow();
    }
  });

  it('replaces the full snapshot when another tab publishes state', () => {
    const remote = { version: 1 as const, data: { boards: { b1: { title: 'Updated' } } } };
    expect(appReducer(initialState, { type: 'REPLACE_STATE', state: remote })).toBe(remote);
  });
});
