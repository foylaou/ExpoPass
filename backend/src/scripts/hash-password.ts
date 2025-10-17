import * as argon2 from 'argon2';

async function hashPassword(password: string) {
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4,
    });

    console.log('─'.repeat(80));
    console.log(`Password: ${password}`);
    console.log(`Hash:     ${hash}`);
    console.log('─'.repeat(80));
    console.log('');

    return hash;
}

async function main() {
    console.log('');
    console.log('═'.repeat(80));
    console.log('                    Argon2 Password Hasher');
    console.log('═'.repeat(80));
    console.log('');

    // 生成三個範例密碼
    const hashes = await Promise.all([
        hashPassword('t0955787053S'),
        hashPassword('Isha04861064'),
    ]);

    console.log('');
    console.log('═'.repeat(80));
    console.log('                    JSON 格式（複製到 .env）');
    console.log('═'.repeat(80));
    console.log('');

    const adminAccounts = [
        {
            username: 'foy',
            password: hashes[0],
            email: 's225002731@gmail.com',
            role: 'super_admin',
        },
        {
            username: 'admin',
            password: hashes[1],
            email: 'isha@mail.isha.org.tw',
            role: 'admin',
        }
    ];

    console.log('ADMIN_ACCOUNTS=' + JSON.stringify(adminAccounts));
    console.log('');
    console.log('═'.repeat(80));
    console.log('');
}

main().catch(console.error);
