import React from 'react';
import DisplayContainer from './components/DisplayContainer';
import JoinGameDisplay from './components/JoinGameDisplay';
import PrimaryGameDisplay from './components/PrimaryGameDisplay';
import TablePlayerDisplay from './components/TablePlayerDisplay';
import { websocketLogin } from './model/websocket';

function App() {
  const [d2, setD2] = React.useState(false);
  const [d3, setD3] = React.useState(false);
  return (
    <div>
      <DisplayContainer>
        {
          d2 ?
            ( d3?
              <PrimaryGameDisplay />
              :
              <TablePlayerDisplay onSubmit={() => setD3(true)} />
            )
            :
            <JoinGameDisplay onSubmit={() => setD2(true)} />
        }
      </DisplayContainer>
    </div>
  );
}

export default App;
