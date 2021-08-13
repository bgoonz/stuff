Secure enough
=============

![Spotify Logo](../resources/spotify-logo.png)

Some disturbing reports have been received at our support department.

**Points: 2**

* A user claims that he is able to change the Spotify password for any user.

An emergency report has been created, and the developer responsible of the only
entry point, server side, where the password change operation is completed in our website, has reviewed the code.

* **Our developer claims that our code is secure enough** as it allows only valid users to change their password.

* ```isLoggedIn``` and ```getAndFilterParam``` are properly implemented, the problem is somewhere else.

* The fragment of code provided, is where the problem must be. 

**Hint:** This code, can be triggered via a URL: e.g. `https://test.tld/change-password/change`

You are responsible of identifying what's wrong with the following code, and tell us
what would it be a plausible scenario for an attack vector.

Fragment of our server side validation code
===========================================

```php

class ChangePasswordController 
{   
    public function changeAction() 
    {
        try {
            if ($this->isLoggedIn()) {
                $password = $this->getAndFilterParam('password');
                $this->getUser()->changePassword($password);
                return new Response(200, 'Success!');
            } else {
                return new Response(403, 'You must be logged in...');
            }
        } catch (\Exception $e) {
            return new Response(500, 'Server error :-(');
        }
    }
}
```
