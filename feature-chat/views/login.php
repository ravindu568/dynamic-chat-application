<h1>LogIn Form</h1>

<!-- Display error message if available -->
<?php if (isset($message)) { ?>
    <h4 style="color: red;"><?php echo $message; ?></h4>
<?php } ?>

<form action="" method="post">

    <input type="text" name="email" placeholder="Enter Your Email" required>
    <br><br>

    <input type="password" name="password" placeholder="Enter your password" required>
    <br><br>

    <input type="submit" value="LogIn">

</form>
