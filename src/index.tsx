import React, { Reducer, useReducer, useCallback, createContext, useContext } from "react";

type Payload = unknown;
type Domain = string;
type Callback = (domainName: Domain, payload: Payload) => void;
type Listener = { id: Symbol, callback: Callback };
type Registry = Map<Domain, Set<Listener>>;
type Context = {
  subscribe: (domains: Domain[], callback: Callback) => () => void,
  publish: (domains: Domain[], payload: Payload) => void
}
type ReducerAction = {
  domains: Domain[],
  listener?: Listener
  payload?: Payload
  type: "subscribe" | "unsubscribe" | "publish"
};

const registryStore: Registry = new Map();

const registryReducer: Reducer<Registry, ReducerAction> = (registry, action) => {
  const getDomainListeners = (domainName: string) => registry.get(domainName) || new Set();

  switch (action.type) {
    case "subscribe": {
      if (!action.listener) return registry;
      for (const domainName of action.domains) {
        const domainListeners = getDomainListeners(domainName);
        domainListeners.add(action.listener);
        registry.set(domainName, domainListeners);
      }
      return registry;
    }
    case "unsubscribe": {
      for (const domainName of action.domains) {
        const domainListeners = getDomainListeners(domainName);
        if (!action.listener || !domainListeners.size) continue;
        domainListeners.delete(action.listener);
      }
      return registry;
    }
    case "publish": {
      for (const domainName of action.domains) {
        const domainListeners = getDomainListeners(domainName);
        if (!domainListeners.size) continue;
        domainListeners.forEach(listener => listener.callback(domainName, action.payload));
      }
      return registry;
    }
    default:
      return registry;
  }
};

const DomainsContext = createContext<Context>({
  subscribe: () => () => {},
  publish: () => {}
});

export const DomainsProvider = (props: { children: JSX.Element }) => {
  const [, dispatch] = useReducer(registryReducer, registryStore);

  const subscribe = useCallback((domains: Domain[], callback: Callback) => {
    const listener = { id: Symbol(), callback };
    dispatch({ type: "subscribe", domains, listener });
    return () => {
      dispatch({ type: "unsubscribe", domains, listener });
    };
  }, []);

  const publish = useCallback((domains: Domain[], payload: Payload) => {
    dispatch({ type: "publish", domains, payload });
  }, []);

  return (
    <DomainsContext.Provider value={{ subscribe, publish }}>
      {props.children}
    </DomainsContext.Provider>
  );
};

export const useDomains = () => useContext(DomainsContext)
