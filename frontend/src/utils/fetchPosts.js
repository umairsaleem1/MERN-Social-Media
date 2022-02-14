
// making request to backend to fetch posts
const fetchPosts = async (setPosts, profileUserId, pageNo, fromSinglePost)=>{
    try{
        let res;
        if(profileUserId){
            res = await fetch(`/posts?profileUserId=${profileUserId}&pageNo=${pageNo}`, {
                credentials: 'include'
            });
        }else{
            res = await fetch(`/posts/?pageNo=${pageNo}`, {
                credentials: 'include'
            });
        }

        if(res.status===401){
            // if user is unauthorized(not logged in), then we will ask to login first
            // navigate('/login'); baad men iska solution find krun ga
            throw new Error(res.statusText);
        }
        else if(!res.ok){
            throw new Error(res.statusText);
        }

        const data = await res.json();
        if(fromSinglePost && pageNo>1){
            setPosts((posts)=>{
                let allPosts = posts.concat(data.posts)
                return allPosts;
            });
        }else{
            setPosts(data.posts);
        }

    }catch(e){
        console.log(e);
    }
}


export default fetchPosts;
