import React from 'react';
import DisplayContainer from './components/DisplayContainer';
import JoinGameDisplay from './components/JoinGameDisplay';
import PrimaryGameDisplay from './components/PrimaryGameDisplay';

function App() {
  const [d2, setD2] = React.useState(false);
  return (
    <div>
      <DisplayContainer>
        {
          d2 ?
            <PrimaryGameDisplay />
            :
            <JoinGameDisplay onSubmit={() => setD2(true)} />
        }
      </DisplayContainer>
    </div>
  );
}

export default App;
