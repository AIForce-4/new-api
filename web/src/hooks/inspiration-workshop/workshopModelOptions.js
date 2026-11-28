export function getWorkshopModelOptions(imageModels, catalog, token, mode) {
  if (!catalog || token?.status !== 1) return [];

  const requestedGroup = token.group;
  if (requestedGroup && (
    !Object.hasOwn(catalog.usableGroups, requestedGroup) ||
    (requestedGroup !== 'auto' && !Object.hasOwn(catalog.groupRatios, requestedGroup))
  )) return [];
  const groups = requestedGroup === 'auto'
    ? catalog.autoGroups
    : [requestedGroup || catalog.userGroup];
  const limits = token.model_limits_enabled
    ? new Set((token.model_limits || '').split(','))
    : null;
  const available = new Set(catalog.models
    .filter((model) => model.enable_groups?.some((group) => groups.includes(group)))
    .map((model) => model.model_name));

  return imageModels
    .filter((name) => available.has(name) && (!limits || limits.has(name)))
    .filter((name) => mode !== 'edit' || !/^(imagen(?:-|$)|dall-e-3$)/i.test(name))
    .map((name) => ({ label: name, value: name }));
}

export function pickWorkshopModel(options, current, defaultModel) {
  if (options.some(({ value }) => value === current)) return current;
  if (options.some(({ value }) => value === defaultModel)) return defaultModel;
  return options[0]?.value || '';
}
