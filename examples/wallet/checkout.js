var citruspg = $.citrus.gateway($.citrus.env.local);
var citruswallet = $.citrus.wallet($.citrus.env.local, token);

function paynow() {
	// reset errors
	$('#payerror').html('');

	// read payment options
	var paymentOptions = {
		mode: $('input[type="radio"][name="paymentMode"]:checked').attr('id'),
		token: $('input[type="radio"][name="walletToken"]:checked').attr('id'),
		tokenCvv: $('input[type="radio"][name="walletToken"]:checked + label input.cvv').val(),
		cardNumber: $('#cardNumber').val(),
		cardHolder: $('#cardHolder').val(),
		cardExpiry: $('#cardExpiry').val(),
		cardCvv: $('#cardCvv').val(),
		bankCode: $('#bank option:selected').val(),
	};

	// make payment
	citruspg.makePayment(
		bill, 
		paymentOptions,
		function(error, redirect) {
			if (error) {
				// redirect
				$('#payerror').html('<p>' + error.error + ': ' + error.message + '</p>');
			}
			else {
				// display error
				$(location).attr({ href: redirect });
			}
		}
	);

	// save payments option in wallet
	citruswallet.save(paymentOptions);
}

function onCard(card) {
	if ($('#token').length == 0) {
		$('ul#checkout li:first-child').before(walletTemplate);
		$('button.pay').click(paynow);
	}
	wallet = $('#token + label + div ul');
	wallet.append(savedCard(card));
	$('input.cvv').payment('formatCardCVC');
	wallet.find('li:first-child input[type="radio"][name="walletToken"]').prop('checked', true);
}

$(document).ready(function() {
	// setup card inputs;
	$('#cardNumber').payment('formatCardNumber');
	$('#cardExpiry').payment('formatCardExpiry');
	$('#cardCvv').payment('formatCardCVC');
	
	// setup make payment buttons
	$('button.pay').click(paynow);

	// populate wallet and select first token
	citruswallet.load(onCard);
});

var walletTemplate = '\
<li>\
	<input type="radio" name="paymentMode" id="token" checked="true"/>\
	<label for="token">saved cards</label>\
	<div>\
		<div>\
			<ul>\
			</ul>\
		</div>\
		<div><button class="pay">make payment</button></div>\
	</div>\
</li>\
';

function savedCard(card) { return '\
<li>\
	<input type="radio" name="walletToken" id="' + card.token + '"/>\
	<label for="' + card.token + '">\
		<span>card ' + card.number + '</span>\
		<span>expires on ' + card.expiry + '</span>\
		<span class="cvv">CVV: <input type="text" class="cvv"/></span>\
	</label>\
</li>\
';
}