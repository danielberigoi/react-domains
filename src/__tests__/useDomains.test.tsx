import * as React from "react";
import { useDomains, DomainsProvider } from "../../lib";
import { act, renderHook } from "@testing-library/react";

const DOMAINS_COUNT = 10;
const HOOK_INSTANCES_COUNT = 50;
const wrapper = (props: { children: any; }) => <DomainsProvider>{props.children}</DomainsProvider>;

test("useDomains PubSub", () => {
  const testPayload = { hello: "there" };
  const testDomains = Array.from({ length: DOMAINS_COUNT }, (_, i) => `test-domain-pubsub-${i}`);

  const { result } = renderHook(() => useDomains(), { wrapper });
  const { subscribe, publish } = result.current;
  const receivedData: Record<string, unknown> = {};

  act(() => {
    subscribe<string>(testDomains, (d, p) => receivedData[d] = p);
    publish<string>(testDomains, testPayload);
  });

  for (const domainName of testDomains) {
    expect(receivedData[domainName]).toEqual(testPayload);
  }
});

test("useDomains Unsubscribe", () => {
  const testPayload = { hello: "there" };
  const testDomains = Array.from({ length: DOMAINS_COUNT }, (_, i) => `test-domain-unsub-${i}`);

  const { result } = renderHook(() => useDomains(), { wrapper });
  const { subscribe, publish } = result.current;
  const receivedData: Record<string, unknown> = {};
  let unsubscribe: Function | null = null;

  act(() => {
    unsubscribe = subscribe(testDomains, (d, p) => receivedData[d] = p);
    unsubscribe();
    publish(testDomains, testPayload);
  });

  expect(unsubscribe).toBeInstanceOf(Function);
  for (const domainName of testDomains) {
    expect(receivedData[domainName]).toBeUndefined();
  }
});

test("useDomains Shared", () => {
  const testPayload = { hello: "there" };
  const testDomains = Array.from({ length: DOMAINS_COUNT }, (_, i) => `test-domain-shared-${i}`);

  const { result } = renderHook(() => Array.from({ length: HOOK_INSTANCES_COUNT }, useDomains), { wrapper });
  const hooks = result.current;
  const receivedData: Record<string, unknown>[] = [];

  act(() => {
    for (const [i, hook] of hooks.entries()) {
      receivedData[i] = {};
      hook.subscribe(testDomains, (d, p) => receivedData[i][d] = p);
    }
    hooks[0].publish(testDomains, testPayload);
  });

  for (const data of receivedData) {
    for (const domainName of testDomains) {
      expect(data[domainName]).toEqual(testPayload);
    }
  }
});
