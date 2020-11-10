Readme for qrOTP.py

Instructions on how to run program:
NOTE:
I tested this using the iOS version of Google Authenticator.

qrOTP uses these libraries:
qrcode, pyotp, base64, hmac, struct, sys, time, and numpy
NOTE: This code is super rough right now.  You definitely don't need to install all of these libraries!
You should only have to install qrcode, pyotp, and numpy.   You can do this by typing in these commands (there is a 99.9 percent chance
that whoever is grading this knows infinitely more about Python than I do, and that this is unnecessary, but I figured I might as well include
this information):
pip install qrcode[pil]
pip install pyotp
pip install numpy

Sometimes numpy can be tricky to install.  Please refer to these links if you have issues:
https://scipy.org/install.html
https://stackoverflow.com/questions/29499815/how-to-install-numpy-on-windows-using-pip-install

If you need to install pip, please refer to this website:
https://pip.pypa.io/en/stable/installing/

Now, to run the script, you can type one of two things:
If you want to generate a QR code, type:
python qrOTP.py --generate-qr
This will generate a QR code in jpg format called 'qr.jpg' in the same directory as the script itself.

