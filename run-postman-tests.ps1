newman run .postman.json --environment .postman-config.json --reporter-cli --color off > test-output.txt 2>&1
Get-Content test-output.txt
