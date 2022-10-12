# react-domains
## A simple PUB/SUB library for React

### Add the provider to your app
```jsx

const App = () => {
  return (
    <DomainsProvider>
      <ComponentA />
      <ComponentB>
        <ComponentC />
      </ComponentB>
    </DomainsProvider>
  );
};

```

### Subscriber component example
```jsx

const ComponentA = () => {
  const { subscribe } = useDomains();
  
  useEffect(() => {
    const unsubscribe = subscribe('domainA', (data) => {
      console.log(data);
    });
    
    return () => {
      unsubscribe();
    };
  }, [subscribe]);
  
  return <h1>Component A</h1>;
};

```

### Publisher component example
```jsx

const ComponentB = () => {
  const { publish } = useDomains();
  
  const publishData = () => {
    publish('domainA', { data: 'Hello World' });
  };
  
  return <button onClick={publishData}>Publish</button>;
};

```

### Subscriber/Publisher component example
```jsx

const ComponentC = () => {
  const { subscribe, publish } = useDomains();
  const [ receivedData, setReceivedData ] = useState(null);
  
  const publishData = () => {
    publish('domainA', { data: 'Hello World' });
    publish('domainB', { data: 'Hello World' });
  };
  
  useEffect(() => subscribe('domainC', setReceivedData), [subscribe]);
  
  return <div>
    <button onClick={publishData}>Publish</button>
    <p>{JSON.stringify(receivedData)}</p>
  </div>;
};

```
