import { useReducer, Reducer } from "react";

type Payload = any;
type Domain = string;
type Callback = (domainName: Domain, payload: Payload) => void;
type Listener = {
  id: Symbol,
  callback: Callback
};
type Registry = Map<Domain, Set<Listener>>;
type Action = {
  domains: Domain[],
  listener?: Listener
  payload?: Payload
  type: "subscribe" | "unsubscribe" | "publish"
};

const registryStore: Registry = new Map();

const reducer: Reducer<Registry, Action> = (registry, action) => {
  const getListeners = (domainName: string) => registry.get(domainName) || new Set();

  switch (action.type) {
    case "subscribe": {
      if (!action.listener) return registry;
      for (const domainName of action.domains) {
        const domainListeners = getListeners(domainName);
        domainListeners.add(action.listener);
        registry.set(domainName, domainListeners);
      }
      return registry;
    }
    case "unsubscribe": {
      for (const domainName of action.domains) {
        const domainListeners = getListeners(domainName);
        if (!action.listener || !domainListeners.size) continue;
        domainListeners.delete(action.listener);
      }
      return registry;
    }
    case "publish": {
      for (const domainName of action.domains) {
        const domainListeners = getListeners(domainName);
        if (!domainListeners.size) continue;
        domainListeners.forEach(listener => listener.callback(domainName, action.payload));
      }
      return registry;
    }
    default:
      return registry;
  }
};

export const useDomains = () => {
  const [, dispatch] = useReducer(reducer, registryStore);

  const subscribe = (domains: Domain[], callback: Callback) => {
    const listener = { id: Symbol(), callback };
    dispatch({ type: "subscribe", domains, listener });
    return () => {
      dispatch({ type: "unsubscribe", domains, listener });
    };
  };

  const publish = (domains: Domain[], payload: Payload) => {
    dispatch({ type: "publish", domains, payload });
  };

  return {
    subscribe,
    publish
  };
};
