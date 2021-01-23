const { default: Web3 } = require('web3')

const StarterKit = artifacts.require('./StarterKit.sol') // Bring smart contract to js file

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('StarterKit' , ([deployer, author, tipper]) => {

    let starterKit

    //Create instance for StarterKit outside of the testing block
    before(async () => { //reduce duplication and allows to keep checking variable value after creating more tests after this deployment description
        starterKit = await StarterKit.deployed()
    })

    //Testing block
    describe('deplyment' , async () => {
        it('deploys successfully', async ()  => {
            const address = await starterKit.address
            assert.notEqual(address,0x0)
            assert.notEqual(address, '')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
        })

        it('has a name' , async () => {
            const name = await starterKit.name()
            assert.equal(name, 'Block World Social Network')
        })
    })

    describe('posts' , async () => {

        let result, postCount, posts

        before(async () => { //reduce duplication and allows to keep checking variable's value after creating more tests after this deployment description
            starterKit = await StarterKit.deployed()
        })

        it('create posts' , async () => {
            result = await starterKit.createPost('This is my first post', { from: author })
            postCount = await starterKit.postCount()
            // SUCESS
            assert.equal(postCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.content, 'This is my first post', 'content is correct')
            assert.equal(event.tipAmount, '0', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')

            // FAILURE: Post must have content

            await starterKit.createPost('', { from: author }).should.be.rejected;

        })
        it('list posts' , async () => {
            const post = await starterKit.posts(postCount)
            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(post.content, 'This is my first post', 'content is correct')
            assert.equal(post.tipAmount, '0', 'tip amount is correct')
            assert.equal(post.author, author, 'author is correct')
        })
        it('allow users to tip the posts' , async () => {

            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author) // Check balance in the wallet
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance) // Convert to Big Number


            result = await starterKit.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })
            
            // SUCESS
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.content, 'This is my first post', 'content is correct')
            assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')

            // Check that author received funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author) // Check balance in the wallet
            newAuthorBalance = new web3.utils.BN(newAuthorBalance) // Convert to Big Number

            // Factor the tip amount
            let tipAmount
            tipAmount = web3.utils.toWei('1', 'Ether')
            tipAmount = new web3.utils.BN(tipAmount)

            const expectedBalance = oldAuthorBalance.add(tipAmount)
            assert.equal(newAuthorBalance.toString(),expectedBalance.toString())

            // FAILURE: Tries to tip a post that does not exist
            
            await starterKit.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') } )
            .should
            .be
            .rejected;
        })
    })
})    