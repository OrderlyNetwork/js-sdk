import {
  DVN_CONFIG_SEED,
  ENDPOINT_SEED,
  ENFORCED_OPTIONS_SEED,
  EVENT_SEED,
  EXECUTOR_CONFIG_SEED,
  LZ_RECEIVE_TYPES_SEED,
  MESSAGE_LIB_SEED,
  NONCE_SEED,
  OAPP_SEED,
  PEER_SEED,
  PRICE_FEED_SEED,
  SEND_CONFIG_SEED,
  SEND_LIBRARY_CONFIG_SEED,
  ULN_SEED,
} from "@layerzerolabs/lz-solana-sdk-v2";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  BROKER_SEED,
  DEV_DST_EID,
  DEV_LOOKUP_TABLE_ADDRESS,
  DEV_OAPP_PROGRAM_ID,
  DEV_PEER_ADDRESS,
  DVN_PROGRAM_ID,
  ENDPOINT_PROGRAM_ID,
  EXECUTOR_PROGRAM_ID,
  MAIN_DST_EID,
  MAINNET_LOOKUP_TABLE_ADDRESS,
  MAINNET_OAPP_PROGRAM_ID,
  MAINNET_PEER_ADDRESS,
  PRICE_FEED_PROGRAM_ID,
  QA_LOOKUP_TABLE_ADDRESS,
  QA_OAPP_PROGRAM_ID,
  QA_PEER_ADDRESS,
  RECEIVE_LIB_PROGRAM_ID,
  SEND_LIB_PROGRAM_ID,
  STAGING_LOOKUP_TABLE_ADDRESS,
  STAGING_OAPP_PROGRAM_ID,
  STAGING_PEER_ADDRESS,
  TOKEN_SEED,
  VAULT_AUTHORITY_SEED,
  SOL_VAULT_SEED,
} from "./constant";

export const getTokenAccounts = (
  token: PublicKey,
  owner: PublicKey,
): PublicKey => {
  const tokenAccount = getAssociatedTokenAddressSync(token, owner, true);
  return tokenAccount;
};

export function getVaultAuthorityPda(VAULT_PROGRAM_ID: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_AUTHORITY_SEED, "utf8")],
    VAULT_PROGRAM_ID,
  )[0];
}

export function getSolVaultPda(VAULT_PROGRAM_ID: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SOL_VAULT_SEED, "utf8")],
    VAULT_PROGRAM_ID,
  )[0];
}

export function getBrokerPDA(
  programId: PublicKey,
  brokerHash: string,
): PublicKey {
  const hash = Array.from(Buffer.from(brokerHash.slice(2), "hex"));
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BROKER_SEED, "utf8"), Buffer.from(hash)],
    programId,
  )[0];
}

export function getTokenPDA(
  programId: PublicKey,
  tokenHash: string,
): PublicKey {
  const hash = Array.from(Buffer.from(tokenHash.slice(2), "hex"));
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TOKEN_SEED, "utf8"), Buffer.from(hash)],
    programId,
  )[0];
}

export function getOAppConfigPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(OAPP_SEED, "utf8")],
    programId,
  )[0];
}

export function getLzReceiveTypesPda(
  programId: PublicKey,
  oappConfigPda: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(LZ_RECEIVE_TYPES_SEED, "utf8"), oappConfigPda.toBuffer()],
    programId,
  )[0];
}

export function getPeerPda(
  OAPP_PROGRAM_ID: PublicKey,
  oappConfigPda: PublicKey,
  dstEid: number,
): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(PEER_SEED, "utf8"), oappConfigPda.toBuffer(), bufferDstEid],
    OAPP_PROGRAM_ID,
  )[0];
}

export function getEndorcedOptionsPda(
  OAPP_PROGRAM_ID: PublicKey,
  oappConfigPda: PublicKey,
  dstEid: number,
): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(ENFORCED_OPTIONS_SEED, "utf8"),
      oappConfigPda.toBuffer(),
      bufferDstEid,
    ],
    OAPP_PROGRAM_ID,
  )[0];
}

export function getSendLibPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MESSAGE_LIB_SEED, "utf8")],
    SEND_LIB_PROGRAM_ID,
  )[0];
}

export function getSendLibConfigPda(
  oappConfigPda: PublicKey,
  dstEid: number,
): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEND_LIBRARY_CONFIG_SEED, "utf8"),
      oappConfigPda.toBuffer(),
      bufferDstEid,
    ],
    ENDPOINT_PROGRAM_ID,
  )[0];
}

export function getDefaultSendLibConfigPda(dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_LIBRARY_CONFIG_SEED, "utf8"), bufferDstEid],
    ENDPOINT_PROGRAM_ID,
  )[0];
}

export function getSendLibInfoPda(sendLibPda: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MESSAGE_LIB_SEED, "utf8"), sendLibPda.toBuffer()],
    ENDPOINT_PROGRAM_ID,
  )[0];
}

export function getEndpointSettingPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ENDPOINT_SEED, "utf8")],
    ENDPOINT_PROGRAM_ID,
  )[0];
}

export function getPeerAddress(OAPP_PROGRAM_ID: PublicKey): Uint8Array {
  let peer_address = DEV_PEER_ADDRESS;
  if (OAPP_PROGRAM_ID.toBase58() === DEV_OAPP_PROGRAM_ID.toBase58()) {
    peer_address = DEV_PEER_ADDRESS;
  }
  if (OAPP_PROGRAM_ID.toBase58() === QA_OAPP_PROGRAM_ID.toBase58()) {
    peer_address = QA_PEER_ADDRESS;
  }
  if (OAPP_PROGRAM_ID.toBase58() === STAGING_OAPP_PROGRAM_ID.toBase58()) {
    peer_address = STAGING_PEER_ADDRESS;
  }
  if (OAPP_PROGRAM_ID.toBase58() === MAINNET_OAPP_PROGRAM_ID.toBase58()) {
    peer_address = MAINNET_PEER_ADDRESS;
  }
  return peer_address;
}

export function getNoncePda(
  OAPP_PROGRAM_ID: PublicKey,
  oappConfigPda: PublicKey,
  dstEid: number,
): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  const peer_address = getPeerAddress(OAPP_PROGRAM_ID);

  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(NONCE_SEED, "utf8"),
      oappConfigPda.toBuffer(),
      bufferDstEid,
      peer_address,
    ],
    ENDPOINT_PROGRAM_ID,
  )[0];
}

export function getEventAuthorityPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED, "utf8")],
    ENDPOINT_PROGRAM_ID,
  )[0];
}

export function getUlnSettingPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ULN_SEED, "utf8")],
    SEND_LIB_PROGRAM_ID,
  )[0];
}

export function getSendConfigPda(
  oappConfigPda: PublicKey,
  dstEid: number,
): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEND_CONFIG_SEED, "utf8"),
      bufferDstEid,
      oappConfigPda.toBuffer(),
    ],
    SEND_LIB_PROGRAM_ID,
  )[0];
}

export function getDefaultSendConfigPda(dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_CONFIG_SEED, "utf8"), bufferDstEid],
    RECEIVE_LIB_PROGRAM_ID,
  )[0];
}

export function getUlnEventAuthorityPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED, "utf8")],
    SEND_LIB_PROGRAM_ID,
  )[0];
}

export function getExecutorConfigPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(EXECUTOR_CONFIG_SEED, "utf8")],
    EXECUTOR_PROGRAM_ID,
  )[0];
}

export function getPriceFeedPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PRICE_FEED_SEED, "utf8")],
    PRICE_FEED_PROGRAM_ID,
  )[0];
}

export function getDvnConfigPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(DVN_CONFIG_SEED, "utf8")],
    DVN_PROGRAM_ID,
  )[0];
}

export function getDstEID(OAPP_PROGRAM_ID: PublicKey) {
  if (OAPP_PROGRAM_ID.toBase58() === MAINNET_OAPP_PROGRAM_ID.toBase58()) {
    return MAIN_DST_EID;
  }

  return DEV_DST_EID;
}

export function getLookupTableAddress(OAPP_PROGRAM_ID: PublicKey): PublicKey {
  if (OAPP_PROGRAM_ID.toBase58() === DEV_OAPP_PROGRAM_ID.toBase58()) {
    console.log(
      "DEV_LOOKUP_TABLE_ADDRESS: ",
      DEV_LOOKUP_TABLE_ADDRESS.toBase58(),
    );
    return DEV_LOOKUP_TABLE_ADDRESS;
  }
  if (OAPP_PROGRAM_ID.toBase58() === QA_OAPP_PROGRAM_ID.toBase58()) {
    return QA_LOOKUP_TABLE_ADDRESS;
  }
  if (OAPP_PROGRAM_ID.toBase58() === STAGING_OAPP_PROGRAM_ID.toBase58()) {
    return STAGING_LOOKUP_TABLE_ADDRESS;
  }
  if (OAPP_PROGRAM_ID.toBase58() === MAINNET_OAPP_PROGRAM_ID.toBase58()) {
    return MAINNET_LOOKUP_TABLE_ADDRESS;
  }

  return DEV_LOOKUP_TABLE_ADDRESS;
}

export function getMessageLibPda(programId?: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MESSAGE_LIB_SEED, "utf8")],
    programId ? programId : SEND_LIB_PROGRAM_ID,
  )[0];
}

export function getMessageLibInfoPda(
  msgLibPda: PublicKey,
  programId?: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MESSAGE_LIB_SEED, "utf8"), msgLibPda.toBytes()],
    programId ? programId : ENDPOINT_PROGRAM_ID,
  )[0];
}

export async function getLookupTableAccount(
  connection: Connection,
  lookupTableAddress: PublicKey,
) {
  const lookupTableAccount = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;

  return lookupTableAccount;
}
