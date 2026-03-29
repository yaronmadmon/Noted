import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data, error } = await supabase.storage.createBucket('uploads', {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket "uploads" already exists — nothing to do.')
    } else {
      console.error('Failed to create bucket:', error.message)
      process.exit(1)
    }
  } else {
    console.log('Bucket "uploads" created successfully.', data)
  }
}

main()
