import * as React from "react";
import { useDomains, DomainsProvider } from "../";
import { act, renderHook } from "@testing-library/react";

const testPayload = { hello: "there" };
const testDomains = Array.from({ length: 10 }, (_, i) => `test-domain-${i}`);

const wrapper = (props: { children: any; }) => <DomainsProvider>{props.children}</DomainsProvider>;

test("useDomains PubSub", () => {
  const { result } = renderHook(() => useDomains(), { wrapper });
  const { subscribe, publish } = result.current;
  const receivedData: Record<string, unknown> = {};

  act(() => {
    subscribe(testDomains, (d, p) => receivedData[d] = p);
    publish(testDomains, testPayload);
  });

  for (const domainName of testDomains) {
    expect(receivedData[domainName]).toEqual(testPayload);
  }
});

test("useDomains Unsubscribe", () => {
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
  const { result } = renderHook(() => [useDomains(), useDomains(), useDomains()], { wrapper });
  const [a, b, c] = result.current;
  const receivedDataA: Record<string, unknown> = {};
  const receivedDataB: Record<string, unknown> = {};
  const receivedDataC: Record<string, unknown> = {};

  act(() => {
    a.subscribe(testDomains, (d, p) => receivedDataA[d] = p);
    b.subscribe(testDomains, (d, p) => receivedDataB[d] = p);
    c.subscribe(testDomains, (d, p) => receivedDataC[d] = p);
    a.publish(testDomains, testPayload);
  });

  for (const domainName of testDomains) {
    expect(receivedDataA[domainName]).toEqual(testPayload);
    expect(receivedDataB[domainName]).toEqual(testPayload);
    expect(receivedDataC[domainName]).toEqual(testPayload);
  }
});
