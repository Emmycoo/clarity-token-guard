# TokenGuard

A Clarity contract for tracking token performance metrics. This contract allows token creators and users to monitor key metrics like:

- Total supply
- Holder count 
- Transfer volume
- Price history
- Top holders

## Features

- Track total supply changes over time
- Monitor transfer volumes and frequencies
- Record price points and calculate metrics
- Track holder distribution
- Generate holder statistics

## Usage

Contract functions can be called to record and retrieve token metrics. Only the contract owner can record new metrics, but anyone can view the historical data.