import React from 'react';
export function RenderPrivyTypeIcon({ type, size, isUsercenter }: { type: string, size: number; isUsercenter?: boolean}) {
  if (type === 'email') {
    if (isUsercenter) {
      return <img src="https://oss.orderly.network/static/sdk/privy/email-black.svg" width={size}  />
    } else {
    return <img src="https://oss.orderly.network/static/sdk/privy/email.svg" width={size}  />
    }
  }
  if (type === 'google') {
    return <img src="https://oss.orderly.network/static/sdk/google.svg" width={size}/>
  }
  if (type === 'twitter') {
    return <img src="https://oss.orderly.network/static/sdk/twitter.svg" width={size} />
  }
  return <img src="https://oss.orderly.network/static/sdk/email.svg"  width={size} />;
}