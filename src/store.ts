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

export type ContextChangeActiveAccessSelector<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
> = (
  context: TContext | undefined,
  activeAccess: TRealmAccess | undefined,
  realmAccessIdGetter: RealmAccessIdGetter<TRealmAccess>,
) => TRealmAccess | undefined;

export function defaultContextChangeActiveAccessSelector<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
>(
  context: TContext | undefined,
  activeAccess: TRealmAccess | undefined,
  realmAccessIdGetter: RealmAccessIdGetter<TRealmAccess> = defaultRealmAccessIdGetter<TRealmAccess>,
): TRealmAccess | undefined {
  if (context && activeAccess) {
    return context.accesses.find((ctxAccess) => realmAccessIdGetter(ctxAccess) === realmAccessIdGetter(activeAccess));
  }

  return context?.accesses[0];
}

export interface RealmAuthStore<
  TRealmAccess extends RealmAccess = RealmAccess,
  TContext extends WhoAmIContext<TRealmAccess> = WhoAmIContext<TRealmAccess>,
> {
  activeAccess: TRealmAccess | undefined;
  context: TContext | undefined; // context could be the whoami response for an authenticated user
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  setContext: (cb: (context: TContext | undefined) => TContext | undefined, isAuthenticating?: boolean) => TContext | undefined;
  setActiveAccess: (realmAccessId: string) => TRealmAccess | undefined;
  reset(): void;
}

export const defaultInitialState = {
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
  contextChangeActiveAccessSelector = defaultContextChangeActiveAccessSelector<TRealmAccess>,
) {
  return create<RealmAuthStore<TRealmAccess, TContext>>((set, get) => ({
    ...defaultInitialState,
    setContext: (cb, isAuthenticating = false) => {
      const { context: prevContext, activeAccess } = get();
      const result = cb(prevContext);

      const isAuthenticated = Boolean(result);

      set({
        context: result,
        isAuthenticating,
        isAuthenticated,
        activeAccess: result ? contextChangeActiveAccessSelector?.(result, activeAccess, realmAccessIdGetter) : undefined,
      });

      return result;
    },
    setActiveAccess: (realmAccessId) => {
      const { activeAccess: prevAccess, context } = get();

      if (prevAccess && realmAccessId === realmAccessIdGetter(prevAccess)) {
        return prevAccess;
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
  contextChangeActiveAccessSelector = defaultContextChangeActiveAccessSelector<TRealmAccess>,
) {
  const useRealmAuthStore = createRealmAuthStore(initialState, realmAccessIdGetter, contextChangeActiveAccessSelector);

  return {
    useRealmAuthStore,
    useRealmAuthActiveAccess: () => useRealmAuthStore(useShallow(selectActiveAccess)),
    useRealmAuthContext: () => useRealmAuthStore(useShallow(selectContext)),
    useRealmAuthIsAuthenticating: () => useRealmAuthStore(selectIsAuthenticating),
    useRealmAuthIsAuthenticated: () => useRealmAuthStore(selectIsAuthenticated),
    useRealmAuthReset: () => useRealmAuthStore(selectReset),
    useRealmAuthSetActiveAccess: () => useRealmAuthStore(selectSetActiveAccess),
    useRealmAuthSetContext: () => useRealmAuthStore(selectSetContext),
  } as const;
}
