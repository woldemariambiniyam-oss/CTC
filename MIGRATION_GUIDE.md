# Migration Guide - Enhanced Features

## Overview

This guide will help you apply all the enhanced features to your existing Coffee Training Center system.

## Step 1: Backup Your Database

**IMPORTANT**: Always backup before making changes!

```bash
mysqldump -u root coffee_training_center > backup_$(date +%Y%m%d).sql
```

## Step 2: Apply Database Schema Updates

Run the schema updates:

```bash
mysql -u root coffee_training_center < database/schema_updates.sql
```

Or manually in MySQL:

```sql
USE coffee_training_center;
SOURCE database/schema_updates.sql;
```

**Note**: If you get errors about columns already existing, you can safely ignore them or modify the SQL to use `IF NOT EXISTS` checks.

## Step 3: Install New Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- `speakeasy` - For 2FA
- `qrcode` - For QR code generation
- `express-session` - For session management
- `connect-redis` - For Redis session storage (optional)

## Step 4: Update Environment Variables

Add to `backend/.env` (if not already present):

```env
# Session timeout (minutes)
SESSION_TIMEOUT_MINUTES=30

# 2FA settings (optional - defaults work)
2FA_ISSUER=Coffee Training Center
```

## Step 5: Restart Backend Server

```bash
cd backend
npm start
```

Or if using nodemon:
```bash
npm run dev
```

## Step 6: Verify New Endpoints

Test the new endpoints:

```bash
# Health check
curl http://localhost:5000/health

# 2FA status (requires login)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/two-factor/status

# Rankings (requires login)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/rankings/leaderboard/1
```

## Step 7: Update Frontend (Optional but Recommended)

The backend is fully functional, but you'll want to add frontend components for:

1. **2FA Setup UI** - For admin/trainer to enable 2FA
2. **Password Reset Pages** - Request and reset forms
3. **Ranking/Leaderboard UI** - Display rankings
4. **Question Bank Management** - CRUD interface
5. **Certificate Collection** - Admin interface
6. **Communication Dashboard** - Notification monitoring
7. **Enhanced Reports** - Custom filters and metrics

## Troubleshooting

### Database Errors

If you get "Duplicate column" errors:
- The column already exists - this is fine
- You can modify `schema_updates.sql` to check first:
  ```sql
  -- Example: Check before adding
  SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'coffee_training_center' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'two_factor_enabled');
  
  SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE',
    'SELECT "Column already exists"');
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  ```

### Package Installation Errors

If npm install fails:
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Backend Won't Start

Check for:
- Missing environment variables
- Port conflicts
- Database connection issues
- Check console for specific errors

## Testing Checklist

After migration, test:

- [ ] Login with 2FA (admin/trainer)
- [ ] Password reset flow
- [ ] Ranking calculation
- [ ] Question bank CRUD
- [ ] Certificate collection workflow
- [ ] Public certificate verification
- [ ] Communication dashboard
- [ ] Enhanced reports
- [ ] Session timeout (wait 30+ minutes of inactivity)

## Rollback Plan

If you need to rollback:

1. Restore database from backup:
   ```bash
   mysql -u root coffee_training_center < backup_YYYYMMDD.sql
   ```

2. Revert code changes:
   ```bash
   git checkout HEAD -- backend/
   ```

3. Reinstall old dependencies:
   ```bash
   cd backend
   npm install
   ```

## Support

See:
- [ENHANCEMENTS_SUMMARY.md](ENHANCEMENTS_SUMMARY.md) - Feature details
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Implementation status
- [docs/API.md](docs/API.md) - Updated API documentation

