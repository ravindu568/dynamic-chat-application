


<h1>Register Form</h1>

<form action="" method="post" enctype="multipart/form-data">

    <input type="text" name="name" placeholder="Enter Your name" required>
    <br><br>
    
    <input type="email" name="email" placeholder="Enter Your email" required>
    <br><br>

    <input type="password" name="password" placeholder="Enter Your password" required>
    <br><br>
    
    <input type="file" name="image" required>
    <br><br>
    
    <input type="submit" value="Register">
    <br><br>

</form>

<!-- Display success message if available -->
<?php if (isset($message)) { ?>
    <h4 style="color: green;"><?php echo $message; ?></h4>
<?php } ?>
