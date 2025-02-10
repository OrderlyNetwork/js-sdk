import React from 'react';
export function RenderPrivyTypeIcon({ type, size }: { type: string, size: number;}) {
  if (type === 'email') {
    return <img src="https://oss.orderly.network/static/sdk/email.svg" width={size}  />
  }
  if (type === 'google') {
    return <img src="https://oss.orderly.network/static/sdk/google.svg" width={size}/>
  }
  if (type === 'twitter') {
    return <img src="https://oss.orderly.network/static/sdk/twitter.svg" width={size} />
  }
  return <img src="https://oss.orderly.network/static/sdk/email.svg"  width={size} />;
}