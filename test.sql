SELECT ul.last_seen, u.username, w.balance, u.createdAt,ul.browser_type, ul.login_succes, ul.login_failed,ul.last_attemp 
FROM user_logs ul 
	LEFT JOIN wallets w on w.wallet_address = ul.wallet_address 
	LEFT JOIN users u on u.id = ul.user_id 
WHERE ul.last_seen >= CURDATE()