import {
  AddOrderlyKeyInputs,
  RegisterAccountInputs,
  type SignatureDomain,
  type WithdrawInputs
} from "@orderly.network/core";
import {bytesToHex, hexToBytes} from "ethereum-cryptography/utils";
import {AbiCoder, decodeBase58, solidityPackedKeccak256} from "ethers";
import {keccak256} from "ethereum-cryptography/keccak";

export function addOrderlyKeyMessage(inputs: AddOrderlyKeyInputs & {chainId: number}) {
  const {
    publicKey,
    brokerId,
    expiration = 365,
    timestamp = Date.now(),
    scope,
    chainId,
  } = inputs;
  const message = {
    brokerId: brokerId,
    chainType: 'SOL',
    orderlyKey: publicKey,
    scope: scope || "read,trading",
    chainId,
    timestamp,
    expiration: timestamp + 1000 * 60 * 60 * 24 * expiration,
  };

  const brokerIdHash = solidityPackedKeccak256(['string'], [message.brokerId]);

  const orderlyKeyHash = solidityPackedKeccak256(['string'], [message.orderlyKey]);
  const scopeHash = solidityPackedKeccak256(['string'], [message.scope]);
  const abicoder = AbiCoder.defaultAbiCoder();
  const msgToSign = keccak256(
    hexToBytes(
      abicoder.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256'],
        [brokerIdHash, orderlyKeyHash, scopeHash,message.chainId,message.timestamp,message.expiration]
      )
    )
  );
  const msgToSignHex = bytesToHex(msgToSign);
  const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
  return [message, msgToSignTextEncoded];

}

export function registerAccountMessage( inputs: RegisterAccountInputs & {
  chainId: number;
}) {
  const { chainId, registrationNonce, brokerId, timestamp } = inputs;

  const message = {
    brokerId,
    chainId,
    timestamp,
    registrationNonce,
  };
  const brokerIdHash = solidityPackedKeccak256(['string'], [message.brokerId]);
  const abicoder = AbiCoder.defaultAbiCoder();
  const msgToSign = keccak256(
    hexToBytes(
      abicoder.encode(
        ['bytes32', 'uint256', 'uint256', 'uint256'],
        [brokerIdHash, message.chainId, message.timestamp, message.registrationNonce]
      )
    )
  )
  const msgToSignHex = bytesToHex(msgToSign);
  const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
  return [message, msgToSignTextEncoded];

}

export function withdrawMessage(  inputs: WithdrawInputs & {
  chainId: number;
}) {
  const { chainId, receiver, token, amount, nonce, brokerId} = inputs;
  const timestamp = Date.now();

  const message ={
    brokerId,
    chainId,
    receiver,
    token:token,
    amount:amount,
    withdrawNonce: nonce,
    timestamp,
    chainType: 'SOL',
  }


  const brokerIdHash = solidityPackedKeccak256(['string'], [message.brokerId]);
  const tokenSymbolHash = solidityPackedKeccak256(['string'], [message.token]);
  const salt = keccak256(Buffer.from('Orderly Network'));
  const abicoder = AbiCoder.defaultAbiCoder();
  const msgToSign = keccak256(
      hexToBytes(
          abicoder.encode(
              ['bytes32', 'bytes32', 'uint256', 'bytes32', 'uint256', 'uint64', 'uint64', 'bytes32'],
              [
                brokerIdHash,
                tokenSymbolHash,
                chainId,
                hexToBytes(decodeBase58(message.receiver).toString(16)),
                message.amount,
                message.withdrawNonce,
                timestamp,
                salt,
              ]
          )
      )
  );
  const msgToSignHex = bytesToHex(msgToSign);
  const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
  return [message, msgToSignTextEncoded];

}