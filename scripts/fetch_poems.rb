#!/usr/bin/env ruby
require 'net/http'
require 'json'
require 'fileutils'
require 'base64'
require 'digest'

REPO = "selinacoppersmith/Witness-My-Depths"
OUTPUT_DIR = "_poems"

# Create the output directory if it doesn't exist
FileUtils.mkdir_p(OUTPUT_DIR)

# Function to recursively fetch contents from a repository path
def fetch_contents(path = "")
  uri = URI("https://api.github.com/repos/#{REPO}/contents/#{path}")
  response = Net::HTTP.get_response(uri)
  
  if response.code == "200"
    contents = JSON.parse(response.body)
    
    # Process each item (file or directory)
    contents.each do |item|
      if item["type"] == "file" && item["name"].end_with?(".md")
        # Download markdown file
        download_markdown_file(item)
      elsif item["type"] == "dir"
        # Recursively fetch contents from subdirectory
        fetch_contents(item["path"])
      end
    end
  else
    puts "Failed to get repository contents at #{path}: #{response.code}"
    puts response.body
  end
end

# Function to create a safe, unique filename
def create_safe_filename(path)
  # Create a readable prefix using the folder path
  parts = path.split('/')
  prefix = parts.size > 1 ? parts[0..-2].join('-') : "root"
  
  # Extract the original filename and its extension
  original_filename = parts.last
  if original_filename =~ /^(.+)(\.\w+)$/
    base_name = $1
    extension = $2
  else
    base_name = original_filename
    extension = ""
  end
  
  # Create a filename part that preserves the original filename (minus extension)
  # Replace any non-alphanumeric characters with dashes except underscores
  filename_part = base_name.gsub(/[^a-zA-Z0-9\-_]/, '-')
  
  # Add a unique hash suffix based on the full path to avoid collisions
  hash_suffix = Digest::MD5.hexdigest(path)[0..7]
  
  # Combine all parts with the hash before the extension
  "#{prefix}-#{filename_part}-#{hash_suffix}#{extension}"
end

# Function to download a single markdown file
def download_markdown_file(item)
  file_uri = URI(item["download_url"])
  file_response = Net::HTTP.get_response(file_uri)
  
  if file_response.code == "200"
    content = file_response.body
    
    # Create a filename that preserves the original format but is safe for the filesystem
    filename = create_safe_filename(item["path"])
    path_parts = item["path"].split('/')
    
    output_path = File.join(OUTPUT_DIR, filename)
    
    # Add front matter if not present
    unless content.start_with?("---")
      # Use path parts to create a hierarchical title
      title = path_parts.last.gsub(/\.md$/, '').gsub(/-/, ' ').gsub(/_/, ' ').gsub(/\b\w/) { $&.upcase }
      folder = path_parts.size > 1 ? path_parts[0..-2].join('/') : nil
      
      front_matter = "---\nlayout: poem\ntitle: #{title}\n"
      front_matter += "folder: #{folder}\n" if folder
      # Add original filename for reference
      front_matter += "original_filename: #{path_parts.last}\n"
      # Add source path for reference
      front_matter += "source_path: #{item["path"]}\n"
      front_matter += "---\n\n"
      
      content = front_matter + content
    end
    
    # Write to file
    File.write(output_path, content)
    puts "Downloaded: #{item["path"]} → #{filename}"
  else
    puts "Failed to download #{item["path"]}: #{file_response.code}"
  end
end

# Start fetching from the root of the repository
fetch_contents

puts "All poems downloaded to #{OUTPUT_DIR} directory" 