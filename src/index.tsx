import React, { useCallback } from 'react';

type DomainName = string;
type Payload<T = unknown> = T;
type Registry = Map<DomainName, Set<Callback>>;
type Callback = (payload: Payload, domainName: DomainName, registry: Registry) => void;

const registryStore: Registry = new Map();

export const useDomains = () => {
  const unsubscribe = useCallback((domains: DomainName[], callback: Callback) => {
    for (const domainName of domains) {
      const domainListeners = registryStore.get(domainName);
      if (!domainListeners || !domainListeners.size) continue;
      domainListeners.delete(callback);
    }
  }, []);

  const subscribe = useCallback((domains: DomainName[], callback: Callback) => {
    for (const domainName of domains) {
      const domainListeners = registryStore.get(domainName) || new Set();
      domainListeners.add(callback);
      registryStore.set(domainName, domainListeners);
    }
    return () => unsubscribe(domains, callback);
  }, []);

  const publish = useCallback((domains: DomainName[], payload: Payload) => {
    for (const domainName of domains) {
      const domainListeners = registryStore.get(domainName);
      if (!domainListeners || !domainListeners.size) continue;
      domainListeners.forEach(callback => callback(payload, domainName, registryStore));
    }
  }, []);

  return { subscribe, publish };
};
