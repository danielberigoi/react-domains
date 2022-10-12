import { useDomains } from "../";
import { act, renderHook } from "@testing-library/react";

const testPayload = { hello: "there" };
const testDomains = ["test-domain-1", "test-domain-2"];

test("useDomains", () => {
  const { result } = renderHook(() => useDomains());
  const { subscribe, publish } = result.current;

  let unsubscribe: Function | null = null;
  let receivedData: Record<string, unknown> = {};

  act(() => {
    unsubscribe = subscribe(testDomains, (domainName, payload) => {
      receivedData[domainName] = payload;
    });

    publish(testDomains, testPayload);
  });


  expect(unsubscribe).toBeInstanceOf(Function);

  for (const domainName of testDomains) {
    expect(receivedData[domainName]).toEqual(testPayload);
  }

  receivedData = {};
  act(() => {
    unsubscribe?.();
    publish(testDomains, testPayload);
  });

  for (const domainName of testDomains) {
    expect(receivedData[domainName]).toBeUndefined();
  }
});
