import qrcode
import pyotp
import base64
import hmac
import struct
import sys
import time
import numpy
import math

command = sys.argv[1]
# If the user types in --generate-qr, a qrcode is generated (well, a dummy one with this info)
if command == "--generate-qr":
    img = qrcode.make(
        "otpauth://totp/Example:bob@google.com?secret=JBSWY3DHEKPK3PXP&issuer=Example")
    img.save('qr.jpg')

#if the user types in --get-otp, an OTP will be generated that matches the password generated by google authenticator
if command == "--get-otp":
    # setting it up so a code is printed out every 30 seconds
    # idea for this was taken from this stack overflow thread:
    # https://stackoverflow.com/questions/474528/what-is-the-best-way-to-repeatedly-execute-a-function-every-x-seconds-in-python
    start = time.time()
    while True:
        # this is the key we're going to use
        # I got the idea for using base64.b32decode() from this stackoverflow thread:
        # https://stackoverflow.com/questions/34001567/google-authenticator-code-does-not-match-server-generated-code?rq=1
        key = base64.b32decode("JBSWY3DHEKPK3PXP", True)
        # hmac.new seems so sensitive about what it will take (I'm so bad at python), and it often felt like I was just throwing things against the wall to see if they would stick
        # when I was trying to figure out how to format the key and time (time wasn't as hard as the key).
        # Getting current unix time and converting from a floating point to an integer (fortunately, this was one of the easiest parts; I zeroed in on 
        # how to generate the proper unix time, and how to use struct.pack fairly quickly)
        msg = int(math.floor(time.time() / 30))
        print(msg)
        # Using the hmac library to generate generate a hashcode/mac
        # .hexdigest() generates a 20-byte hexadecimal number, which we can easily get the totppass from via the truncation method
        # described in the manual for the hotp algorithm
        hashcode = hmac.new(key, struct.pack('i', msg), 'sha1').hexdigest()
        # -1 gives us the final element in the hashcode list/array, which is going to be the final 4 bits.  We stick that into offset
        offset = int(hashcode[-1], 16)
        print(hashcode)
        # using offset to pull 32 bits from 160 bits of hashcode/mac
        # Since our hash is in hexadecimal form, which means the 20 bytes are going to be represented by 40 elements, we need to multiply the offset by 2 to start 
        # at the correct index (if you were working with a byte array, you'd start with offset and then go to offset + 4).  The end point is offset* 2 + 8 (8 elements in a
        # hexadecimal array is equal to 4 bytes).
        # This result is the totp password in int form
        # This part took me absolutely forever to figure out.  Sometimes I'd generate the correct totpPass and others I wouldn't, and it didn't make sense to me.
        # I finally found this stackoverflow thread:
        # https://stackoverflow.com/questions/46625819/what-does-0x7fffffff-mean-in-inttime-time1000-0-0x7fffffff
        # which showed me that I needed to clear out the signed bit (so that the result is always positive)
        trunc = int(hashcode[offset*2:(offset*2) + 8], 16) & 0x7fffffff
        # We want the password to be 6 digits long (like the one the google authenticator produces), so we apply mod 10^6 to trunc
        totpPass = trunc % 1000000
        # If totpPass is something like 005640, we need to manually insert the 0s to the left of the 5 (there are better ways to do this, but I'm awful with Python)
        # So, I get the length of the number, and then subtract it from 6.  I then use the difference in the subsequent while-loop to print out the needed 0s
        length = 6 - len(str(totpPass))
        # making sure to print out enough 0s, so that we have a 6 digit pass
        while length > 0:
            print("0", end='')
            length -= 1
        print(totpPass)
        # Makes it so program sleeps for 30 seconds in between every totppass print
        time.sleep(30.0 - ((time.time() - start) % 30.0))