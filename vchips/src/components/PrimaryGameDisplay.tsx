import React from 'react'

export default function PrimaryGameDisplay() {
  const [colors, setColors] = React.useState(1);
  return (
    <div className={`h-full w-full transition-all color-${colors % 5}`}>
      TODO
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path stroke-width="10" id="svg_6" d="m15.84159,53.96038l23.76237,29.20794l41.58417,-64.35644" opacity="NaN" stroke="#000000" fill="#fff0" />
      </svg>
      <button onClick={() => setColors(colors + 1)}>Change</button>
    </div>
  )
}
