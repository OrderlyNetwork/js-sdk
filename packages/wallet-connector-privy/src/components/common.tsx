import React from 'react';
export function RenderPrivyTypeIcon({ type, size, black }: { type: string, size: number; black?: boolean}) {
  if (type === 'email') {
    return <img src={`https://oss.orderly.network/static/sdk/privy/email${black ? '-black' : ''}.svg`} width={size}  />
  }
  if (type === 'google_oauth') {
    return <img src="https://oss.orderly.network/static/sdk/privy/google.svg" width={size}/>
  }
  if (type === 'twitter_oauth') {
    return <img src={`https://oss.orderly.network/static/sdk/privy/twitter${black ? '-black' : ''}.svg`} width={size}  />
  }
  return <img src={`https://oss.orderly.network/static/sdk/privy/email${black ? '-black' : ''}.svg`}  width={size} />;
}