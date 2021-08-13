REMOTE=origin
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BATCH_SIZE=10

# check if the branch exists on the remote
# if git show-ref --quiet --verify refs/remotes/$REMOTE/master; then
#     # if so, only push the commits that are not on the remote already
#     range=$REMOTE/master..HEAD
# else
#     # else push all the commits
#     range=HEAD
# fi

range=HEAD

echo "Range: $r"

# count the number of commits to push
n=$(git log --first-parent --format=format:x $range | wc -l)

echo "Commits to push: $n"

# push each batch
for i in $(seq $n -$BATCH_SIZE 1); do
    # get the hash of the commit to push
    h=$(git log --first-parent --reverse --format=format:%H --skip $i -n1)
    echo "Pushing $h..."
    git push $REMOTE $h:refs/heads/master --force
done

# push the final partial batch
git push $REMOTE HEAD:refs/heads/master