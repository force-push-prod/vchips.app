import React from 'react';
import DisplayContainer from './components/DisplayContainer';
import ClientController from './components/ClientController';
import { PokerServer } from './poker';
import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend';

function App() {
  const [x, update] = React.useState(1);

  React.useEffect(() => {
    // @ts-ignore
    globalThis.server = new PokerServer();
    // setInterval(() => update(x => x + 1), 100);
  }, []);


  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <div>
        <div className="flex">
          <DisplayContainer>
            <ClientController />
          </DisplayContainer>
          <DisplayContainer>
            <ClientController />
          </DisplayContainer>
          <DisplayContainer>
            <ClientController />
          </DisplayContainer>
        </div>
        <pre className="cursor-pointer" onClick={() => update(x + 1)}>{
          // @ts-ignore
          JSON.stringify(globalThis.server, null, 2) ?? 'x'
        }</pre>
      </div>
    </DndProvider>
  );
}

export default App;
