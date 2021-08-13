#!/bin/bash

# This function is used to concatenate the parameters.
# Due to docker py limitations we cannot pass them as one string
# to the shell and eval it.
function concatenate_args
{
    string=""
    for a in "$@" # Loop over arguments
    do
        if [[ "$string" != "" ]]
        then
            string+=" " # Delimeter
        fi
        string+="$a"
    done
    echo "$string"
}

env;

cd `dirname "$0"`;
{{env_manager}};

command="$(concatenate_args "$@")";

if [ $# -eq 0 ]  || [[ $# -gt 0  &&  -z "$command" ]]
then
	# Launch the app in background
	{{launch}} &
else
	eval "$command" &
fi

# After launch
{% if after_launch %}
{{after_launch}}
{% endif %}
