import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensures only owner can record metrics",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    let block = chain.mineBlock([
      // Owner recording metrics - should succeed
      Tx.contractCall('token-guard', 'record-metrics', [
        types.uint(1000000), // total supply
        types.uint(100),     // holders
        types.uint(50000),   // volume
        types.uint(100)      // price
      ], deployer.address),
      
      // Non-owner recording metrics - should fail
      Tx.contractCall('token-guard', 'record-metrics', [
        types.uint(1000000),
        types.uint(100),
        types.uint(50000),
        types.uint(100)
      ], wallet1.address)
    ]);

    block.receipts[0].result.expectOk();
    block.receipts[1].result.expectErr(types.uint(100)); // err-owner-only
  }
});

Clarinet.test({
  name: "Can retrieve recorded metrics",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Record metrics
    let block = chain.mineBlock([
      Tx.contractCall('token-guard', 'record-metrics', [
        types.uint(1000000),
        types.uint(100),
        types.uint(50000),
        types.uint(100)
      ], deployer.address)
    ]);

    // Get current stats
    let statsBlock = chain.mineBlock([
      Tx.contractCall('token-guard', 'get-current-stats', [], deployer.address)
    ]);

    const stats = statsBlock.receipts[0].result.expectOk().expectTuple();
    assertEquals(stats['holders'], types.uint(100));
    assertEquals(stats['volume'], types.uint(50000));
    assertEquals(stats['price'], types.uint(100));
    assertEquals(stats['metrics-count'], types.uint(1));
  }
});

Clarinet.test({
  name: "Can track holder statistics",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    // Update holder stats
    let block = chain.mineBlock([
      Tx.contractCall('token-guard', 'update-holder-stats', [
        types.principal(wallet1.address),
        types.uint(5000)
      ], deployer.address)
    ]);

    // Get holder info
    let infoBlock = chain.mineBlock([
      Tx.contractCall('token-guard', 'get-holder-info', [
        types.principal(wallet1.address)
      ], deployer.address)
    ]);

    const holderInfo = infoBlock.receipts[0].result.expectSome().expectTuple();
    assertEquals(holderInfo['balance'], types.uint(5000));
  }
});