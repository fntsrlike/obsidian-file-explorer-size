export interface OptionalIntegrationState {
  installed: boolean;
  enabled: boolean;
}

export function shouldShowMakeNavigatorSettings(
  state: OptionalIntegrationState
): boolean {
  return state.installed && state.enabled;
}
