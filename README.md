![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

# React Domains

> A simple PUB/SUB library for React

## Prerequisites

To install and set up the library, run:

```sh
$ npm install react-domains
# or
$ yarn add react-domains
# or
$ pnpm install react-domains
```

## API

### useDomains hook

```js
useDomains();
```
---
`subscribe`
> Need to provide a list of domains to subscribe to and callback function. Returns an unsubscribe function.

| Type        | Parameters                                       | Return      |
|-------------|--------------------------------------------------|-------------|
| `Function`  | `domainsList: string[]`, `callback: () => void`  | `Function`  |

---
`publish`
> Need to provide a list of domains to publish to and a payload.

| Type       | Parameters                                    | Return  |
|------------|-----------------------------------------------|---------|
| `Function` | `domainsList: string[]`, `payload: unknown`   | `void`  |


Example:

```tsx
const MyComponent = () => {
  const { subscribe, publish } = useDomains();
  const [ receivedData, setReceivedData ] = useState(null);

  // Publish data to domains A and B
  const publishData = () => {
    publish(['domainA', 'domainB'], { data: 'Hello World' });
  };
  
  // Subscribe/Listen for data changes on domainC and update local state
  // Verbose version:
  useEffect(() => {
    const unsubscribe = subscribe('domainC', (data) => {
      setReceivedData(data);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);
  
  // Shorter version:
  useEffect(() => subscribe('domainC', setReceivedData), [subscribe]);

  return <div>
    <button onClick={publishData}>Publish</button>
    <p>{JSON.stringify(receivedData)}</p>
  </div>;
};
```

## License

[MIT License](https://opensource.org/licenses/MIT)
