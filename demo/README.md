# Demo Time

This is a simple demo to perform basic functional testing that can't be covered by the unit tests.

*Assumptions*

- You are able to create an S3 bucket, otherwise this would be a pointless demo.
- You are using `aws-vault` to wrap the demo in.

## Run the demo

1. Create a S3 bucket in the ap-southeast-2 region.
2. Update the demo with the bucket name.
3. Run the demo: `aws-vault exec <PROFILE NAME> node index`
4. Bask in the glory.
5. Fin.
