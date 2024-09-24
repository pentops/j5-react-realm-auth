import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { type RealmAccess, type WhoAmIContext } from './types';
import {
  selectActiveAccess,
  selectContext,
  selectIsAuthenticated,
  selectIsAuthenticating,
  selectReset,
  selectSetActiveAccess,
  selectSetContext,
} from './selectors';

export type RealmAccessIdGetter<TRealmAccess extends RealmAccess = RealmAccess> = (realmAccess: TRealmAccess) => string;

export function defaultRealmAccessIdGetter<TRealmAccess extends RealmAccess = RealmAccess>(realmAccess: TRealmAccess) {
  return [realmAccess.realm.realmId, realmAccess.tenant.tenantId].filter(Boolean).join(':');
}

export type DefaultActiveAccessSelector<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
> = (context: TContext) => TRealmAccess | undefined;

export interface RealmAuthStore<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
> {
  activeAccess: TRealmAccess | undefined;
  context: TContext | undefined; // context could be the whoami response for an authenticated user
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  setContext: (
    cb: (context: TContext | undefined) => TContext | undefined,
    defaultActiveAccessSelector?: DefaultActiveAccessSelector<TRealmAccess, TContext>,
    isAuthenticating?: boolean,
  ) => TContext | undefined;
  setActiveAccess: (realmAccessId: string) => TRealmAccess | undefined;
  reset(): void;
}

const defaultInitialState = {
  activeAccess: undefined,
  context: undefined,
  isAuthenticating: true,
  isAuthenticated: false,
} as const;

export function createRealmAuthStore<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(
  initialState?: Partial<RealmAuthStore<TRealmAccess, TContext>>,
  realmAccessIdGetter: RealmAccessIdGetter<TRealmAccess> = defaultRealmAccessIdGetter<TRealmAccess>,
) {
  return create<RealmAuthStore<TRealmAccess, TContext>>((set, get) => ({
    ...defaultInitialState,
    setContext: (cb, defaultActiveAccessSelector, isAuthenticating = false) => {
      const { context: prevContext } = get();
      const result = cb(prevContext);

      const isAuthenticated = Boolean(result);

      set({ context: result, isAuthenticating, isAuthenticated, activeAccess: result ? defaultActiveAccessSelector?.(result) : undefined });

      return result;
    },
    setActiveAccess: (realmAccessId) => {
      const { activeAccess: prevAccess, context } = get();

      if (prevAccess && realmAccessId === realmAccessIdGetter(prevAccess)) {
        return;
      }

      const access = context?.accesses?.find((ctxAccess) => realmAccessId === realmAccessIdGetter(ctxAccess));

      if (!access) {
        return;
      }

      set({ activeAccess: access });
      return access;
    },
    reset() {
      set({ ...defaultInitialState, ...initialState });
    },
    ...initialState,
  }));
}

export function createRealmAuthStoreHooks<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(
  initialState?: Partial<RealmAuthStore<TRealmAccess, TContext>>,
  realmAccessIdGetter: RealmAccessIdGetter<TRealmAccess> = defaultRealmAccessIdGetter<TRealmAccess>,
) {
  const useRealmAuthStore = createRealmAuthStore(initialState, realmAccessIdGetter);

  return {
    useRealmAuthStore,
    useRealmAuthActiveAccess: () => useRealmAuthStore(useShallow(selectActiveAccess)),
    useRealmAuthContext: () => useRealmAuthStore(useShallow(selectContext)),
    useRealmAuthIsAuthenticating: () => useRealmAuthStore(selectIsAuthenticating),
    useRealmAuthIsAuthenticated: () => useRealmAuthStore(selectIsAuthenticated),
    useRealmAuthReset: () => useRealmAuthStore(selectReset),
    useRealmAuthSetActiveAccess: () => useRealmAuthStore(selectSetActiveAccess),
    useRealmAuthSetContext: () => useRealmAuthStore(selectSetContext),
  };
}
