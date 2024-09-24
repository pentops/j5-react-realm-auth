import type { RealmAuthStore } from './store';
import type { RealmAccess, WhoAmIContext } from './types';

export function selectActiveAccess<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(state: RealmAuthStore<TRealmAccess, TContext>) {
  return state.activeAccess;
}

export function selectContext<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(state: RealmAuthStore<TRealmAccess, TContext>) {
  return state.context;
}

export function selectIsAuthenticating<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(state: RealmAuthStore<TRealmAccess, TContext>) {
  return state.isAuthenticating;
}

export function selectIsAuthenticated<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(state: RealmAuthStore<TRealmAccess, TContext>) {
  return state.isAuthenticated;
}

export function selectReset<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(state: RealmAuthStore<TRealmAccess, TContext>) {
  return state.reset;
}

export function selectSetActiveAccess<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(state: RealmAuthStore<TRealmAccess, TContext>) {
  return state.setActiveAccess;
}

export function selectSetContext<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(state: RealmAuthStore<TRealmAccess, TContext>) {
  return state.setContext;
}
