import json
import boto3
import os
import zipfile
import shutil
import logging
import subprocess


logging.basicConfig(level=logging.INFO)

s3 = boto3.client('s3')


def print_folder_structure(folder_path):
    # Define your logic to print folder structure here, if needed.
    pass

def run_chmod(path):
    try:
        subprocess.run(["chmod", "777", "-R", path], check=True)
        return {'success': True}
    except subprocess.CalledProcessError as e:
        return {'success': False, 'error': str(e)}


def handler(event, context):
    function_name = event['functionName']
    efs_id = event['efsId']
    modules_s3_key = event['modulesS3Key']
    s3_bucket = event['s3Bucket']
    params = event.get('params', {})

    res_path = '/mnt/efs/res'

    allowed_commands = [
        'chmod',
        'modules_exist',
        'remove_modules',
        'list_modules'
    ]

    # Create the 'res' directory if it doesn't exist
    if not os.path.exists(res_path):
        os.makedirs(res_path, exist_ok=True)

    modules_path = os.path.join(res_path, 'modules')
    downloads_path = os.path.join(res_path, 'downloads')
    dest_function_dir_path = os.path.join(modules_path, function_name)
    dest_downloads_dir_path = os.path.join(downloads_path, function_name)

    # Check and create 'modules_path' directory if it doesn't exist
    if not os.path.exists(modules_path):
        os.makedirs(modules_path, exist_ok=True)

    # Check and create 'dest_function_dir_path' directory if it doesn't exist
    if not os.path.exists(dest_function_dir_path):
        os.makedirs(dest_function_dir_path, exist_ok=True)

    # Check and create 'downloads_path' directory if it doesn't exist
    if not os.path.exists(downloads_path):
        os.makedirs(downloads_path, exist_ok=True)

    # Check and create 'dest_downloads_dir_path' directory if it doesn't exist
    if not os.path.exists(dest_downloads_dir_path):
        os.makedirs(dest_downloads_dir_path, exist_ok=True)

    if params and 'command' in params:
        if params['command'] in allowed_commands:
            try:
                command = params['command']
                if command == 'chmod':
                    # Your chmod logic here

                    return {'success': True, 'path': dest_function_dir_path}
                elif command == 'modules_exist':
                    return {'success': os.path.exists(dest_function_dir_path), 'path': dest_function_dir_path}
                elif command == 'remove_modules':
                    shutil.rmtree(dest_function_dir_path)
                    return {'success': not os.path.exists(dest_function_dir_path), 'path': dest_function_dir_path}
                elif command == 'list_modules':
                    # Your logic to list modules here
                    return {
                        'success': True,
                        'path': dest_function_dir_path,
                        'structure': print_folder_structure(dest_function_dir_path)
                    }
            except Exception as e:
                print(e)
                raise Exception(str(e))
        else:
            return {'success': False, 'error': 'Command unavailable'}
    

    try:
        s3_response = s3.get_object(Bucket=s3_bucket, Key=modules_s3_key)
        zip_path = os.path.join(dest_downloads_dir_path, modules_s3_key)
        with open(zip_path, 'wb') as zip_file:
            zip_file.write(s3_response['Body'].read())

        print('[S3 Download Finished]', zip_path)

        # Ensure that the destination directory exists before extracting
        os.makedirs(dest_function_dir_path, exist_ok=True)

        run_chmod(dest_function_dir_path)

        # Unzip and move files while creating subdirectories as needed
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Separate regular files and symbolic links
            regular_files = [f for f in zip_ref.infolist() if not f.is_dir() and f.external_attr >> 28 != 0o12]
            symlinks = [f for f in zip_ref.infolist() if f.external_attr >> 28 == 0o12]

            # First, extract all regular files
            for file_info in regular_files:
                file_path = os.path.join(dest_function_dir_path, file_info.filename)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, 'wb') as file:
                    file.write(zip_ref.read(file_info.filename))
                os.chmod(file_path, 0o777)  # Set the permissions to 777
    

            # Then, extract all symbolic links
            for file_info in symlinks:
                target_path = zip_ref.read(file_info.filename).decode()
                symlink_path = os.path.join(dest_function_dir_path, file_info.filename)
                os.symlink(target_path, symlink_path)
                os.chmod(symlink_path, 0o777)  # Set the permissions to 777


        run_chmod(dest_function_dir_path)
        

        response = {
            'success': True,
            'path': dest_function_dir_path,
        }

    except Exception as e:
        print('[Error]', e)
        response = {
            'success': False,
            'errorCategory': 'GENERAL_ERROR',
            'error': str(e)
        }

    return response
