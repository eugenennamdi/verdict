import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 5L12 19L20 5"
            stroke="#f97316"
            strokeWidth="4"
            strokeMiterlimit="10"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
