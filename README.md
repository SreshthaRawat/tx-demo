blockchain demo project to have more understanding of the topic.

so the basic idea is that, it's a Next.js decentralised app made using ethers.js. 
It connects with MetaMask using BrowserProvider, fetches the user’s wallet balance, and sends a signed transaction using signer.sendTransaction. 
Then I wait for the transaction receipt to confirm it and display block number and gas used. voila!

so the flow is like:
1. we use MetaMask (the wallet) to talk directly to the Blockchain (a global or shared database).

2. then comes the interface.

3. Ethers.js connects to website to the blockchain.

4. MetaMask holds the user's keys and approves actions.
