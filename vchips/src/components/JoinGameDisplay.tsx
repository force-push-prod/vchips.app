import React from 'react'

interface Props {
  previousId?: string;
  onSubmit: (fields: { name: string, code: string }) => void;
}

export default function JoinGameDisplay({ previousId, onSubmit }: Props) {
  const [name, setName] = React.useState(previousId ?? '');
  const [code, setCode] = React.useState('');
  return (
    <div>
      <div className="m-3">
        <label>Your Name</label>
        <input className="border rounded mx-2" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="m-3">
        <label>Game Code</label>
        <input className="border rounded mx-2" value={code} onChange={(e) => setCode(e.target.value)} />
      </div>
      <button className="border-2 border-blue-800 rounded px-5 m-3 bg-blue-200" type="submit" onClick={() => onSubmit && onSubmit({ name, code })}>Go</button>
    </div>
  )
}
