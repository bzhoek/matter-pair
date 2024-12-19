# matter-pair

The format is described in the Commissioning chapter of the Matter Core Specification. 

The 10-digit manual pairing code without vendor ID and product ID is the concatenation of three numbers generated from:

 - 1-digit number for version, vendor/product id present flag, and 2 ms-bits of discriminator
 - 5-digit number for next 2 ms-bits of discriminator and 14 ls-bits of passcode
 - 4-digit number for 13 ms-bits of passcode

Note that only the 4 ms-bits of the discriminator are used for the pairing code.