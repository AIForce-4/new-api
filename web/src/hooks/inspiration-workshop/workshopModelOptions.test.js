import { expect, test } from 'bun:test';
import { getWorkshopModelOptions, pickWorkshopModel } from './workshopModelOptions';

const imageModels = ['gpt-image-2', 'imagen-4.0-generate-001', 'custom-image'];
const catalog = {
  userGroup: 'default',
  usableGroups: { default: '', gemini: '', auto: '', retired: '' },
  groupRatios: { default: 1, gemini: 1 },
  autoGroups: ['default', 'gemini'],
  models: [
    { model_name: 'gpt-image-2', enable_groups: ['default'] },
    { model_name: 'imagen-4.0-generate-001', enable_groups: ['gemini'] },
    { model_name: 'gemini-text', enable_groups: ['gemini'] },
    { model_name: 'custom-image', enable_groups: ['gemini', 'retired'] },
  ],
};
const values = (token, mode = 'generate') => getWorkshopModelOptions(
  imageModels, catalog, { status: 1, ...token }, mode,
).map(({ value }) => value);

test('uses the token group, including inherited and auto groups', () => {
  expect(values({})).toEqual(['gpt-image-2']);
  expect(values({ group: 'gemini' })).toEqual(['imagen-4.0-generate-001', 'custom-image']);
  expect(values({ group: 'auto' })).toEqual(imageModels);
  expect(values({ group: 'retired' })).toEqual([]);
  expect(values({ group: 'inaccessible' })).toEqual([]);
});

test('intersects the token allowlist with the workshop and excludes generation-only models from editing', () => {
  const token = {
    group: 'gemini', model_limits_enabled: true,
    model_limits: 'imagen-4.0-generate-001,gemini-text,gpt-image-2',
  };
  expect(values(token)).toEqual(['imagen-4.0-generate-001']);
  expect(values(token, 'edit')).toEqual([]);
  expect(values({ group: 'gemini' }, 'edit')).toEqual(['custom-image']);
  expect(values({ ...token, model_limits: '' })).toEqual([]);
  expect(values({ ...token, status: 2 })).toEqual([]);
  expect(getWorkshopModelOptions(imageModels, catalog, undefined, 'generate')).toEqual([]);
});

test('a token switch keeps only an applicable current/default model or falls back safely', () => {
  const options = [{ value: 'imagen-4.0-generate-001' }, { value: 'custom-image' }];
  expect(pickWorkshopModel(options, 'gpt-image-2', 'gpt-image-2')).toBe('imagen-4.0-generate-001');
  expect(pickWorkshopModel(options, 'missing', 'custom-image')).toBe('custom-image');
  expect(pickWorkshopModel(options, 'custom-image', 'imagen-4.0-generate-001')).toBe('custom-image');
  expect(pickWorkshopModel([], 'gpt-image-2', 'gpt-image-2')).toBe('');
});
