#!/bin/bash
# This is free and unencumbered software released into the public domain.
# Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
# In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
# successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
# For more information, please refer to <http://unlicense.org/>

# Sets the secret in gcloud secret manager from the local snowbot-web/.env file
# run get-env.sh to load different envs from the secret manager or to share with others
# use multiple secret names for multiple envs

#uncomment to login to gcloud
gcloud auth login

$secret_name="$1"
$gcloud_project="$2"

#set the path to the web root of this project
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

gcloud config set project $glcoud_project

## LOOK HERE ############################################
# first version requires the create command:
gcloud secrets create $secret_name --data-file="$parent_path/../../snowbot-web/.env"

# uncommend this line after the secret is created (or add the existence check)
# gcloud secrets versions add $secret_name --data-file="$parent_path/../../snowbot-web/.env"
##########################################################