<?php include('layouts/header.php'); ?>

<h2 class="mb-4">Hiiiiii.... <?php echo $user['name']; ?></h2>

<div class="row">
   <div class="col-md-4">
    <ul class="list-group">
        <?php if (count($users) > 0) { ?>
            <?php foreach ($users as $userItem) { ?>
                <li class="list-group-item list-group-item-dark cursor-pointer user-list" data-id="<?php echo $userItem['_id']; ?>" style="display: flex;justify-content: space-around;align-items: center;">
                    <img src="<?php echo 'http://127.0.0.1:3000/' . $userItem['image']; ?>" alt="" width="50px" height="50px" style="border-radius: 40px;">   
                    <?php echo $userItem['name']; ?>
                    <?php if ($userItem['is_Online'] == 1) { ?>
                        <div class="user-online" id="<?php echo $userItem['_id']; ?>+status"></div>
                    <?php } else { ?>
                        <div class="user-offline" id="<?php echo $userItem['_id']; ?>+status"></div>
                    <?php } ?>
                </li>
            <?php } ?>
        <?php } ?>        
    </ul>
</div>

<div class="col-md-8">
    <h3 class="start-head">Click Here To Start</h3>
    <div class="chat-section">
        <div id="chat-container"></div>
        <form action="" method="post" id="chat-form">
            <input type="text" id="message" name="message" placeholder="Enter Message Here" class="border" required>
            <input type="submit" value="Send Message" class="btn btn-success">
        </form>
    </div>
</div>
</div>

<script>
    var sender_id = '<?php echo $user['_id']; ?>';
    var receiver_id;
    var socket = io('/user-namespace', {
        auth: {
            token: '<?php echo $user['_id']; ?>'
        }
    });

    $(document).ready(function(){
        $('.user-list').click(function(){
            var userId = $(this).attr('data-id');
            receiver_id = userId;

            $('.start-head').hide();
            $('.chat-section').show();
        });
    });

    // update user online status
    socket.on('getOnlineUser', (data) => {
        $('#' + data.user_Id + 'status').removeClass('user-offline');
        $('#' + data.user_Id + 'status').addClass('user-online');
    });

    socket.on('getOfflineUser', (data) => {
        $('#' + data.user_Id + 'status').removeClass('user-online');
        $('#' + data.user_Id + 'status').addClass('user-offline');
    });

    // user chat establishing
    $("#chat-form").submit(function(event){
        event.preventDefault();

        var message = $('#message').val();

        $.ajax({
            url: '/save-chat',
            type: 'post',
            data: {
                sender_id: sender_id,
                receiver_id: receiver_id,
                message: message
            },
            success: function(response){
                if (response.success) {
                    $('#message').val('');
                    console.log(response.message);

                    let html = `
                    <div class="current-user-chat">
                        <h5>` + response.message + `</h5>
                    </div>
                    `;

                    $('#chat-container').append(html);

                    socket.emit('newChat', response.data);
                } else {
                    alert(response.msg);
                }
            }
        });
    });

    socket.on('loadNewChat', (data) => {
        if (sender_id == data.receiver_id && receiver_id == data.sender_id) {
            let html = `
            <div class="distance-user-chat">
                <h5>` + data.message + `</h5>
            </div>`;
            $('#chat-container').append(html);
        }
    });
</script>

<?php include('layouts/footer.php'); ?>
