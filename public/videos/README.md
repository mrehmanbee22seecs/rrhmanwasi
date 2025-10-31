# Community Service Videos for Wasillah Special Theme

This directory contains looping background videos used in hero sections when the Wasillah Special theme is active.

## Required Videos

### Hero Section Videos (Page-Specific)

#### Home Page
- `home-hero.mp4` - General community service, volunteers helping, diverse activities
- Duration: 30-60 seconds (will loop)
- Content: Overview of various community service activities

#### About Page
- `about-hero.mp4` - Team working together, collaboration, unity
- Duration: 30-60 seconds
- Content: People coming together for a common cause

#### Projects Page
- `projects-hero.mp4` - Active projects, construction, building, implementation
- Duration: 30-60 seconds
- Content: Hands-on project work, visible progress

#### Events Page
- `events-hero.mp4` - Community gatherings, celebrations, workshops
- Duration: 30-60 seconds
- Content: Events and community activities

#### Volunteer Page
- `volunteer-hero.mp4` - Volunteers in action, diverse roles, smiling faces
- Duration: 30-60 seconds
- Content: Volunteer experiences and impact

#### Contact Page
- `contact-hero.mp4` - Communication, connection, outreach
- Duration: 30-60 seconds
- Content: People connecting and communicating

## Video Specifications

1. **Format**: MP4 (H.264 codec)
2. **Resolution**: 1920x1080 (Full HD) minimum
3. **Aspect Ratio**: 16:9
4. **File Size**: Optimize to under 10MB per video for web performance
5. **Frame Rate**: 24-30 fps
6. **Audio**: None required (videos will be muted)
7. **Length**: 30-60 seconds (seamless loop)

## Content Guidelines

1. **Emotional Tone**: 
   - Warm and inviting
   - Hopeful and inspiring
   - Authentic and genuine
   - Not overly staged

2. **Visual Quality**:
   - Well-lit scenes
   - Stable footage (not shaky)
   - Clear subjects
   - Natural colors

3. **Content**:
   - Real community service activities
   - Diverse representation
   - Positive interactions
   - Visible impact

4. **Technical**:
   - Seamless loop (start/end should match)
   - Smooth motion (no jarring cuts)
   - Optimized for web (compressed appropriately)

## Fallback Behavior

If videos are not available:
- A fallback image will be displayed (from poster attribute)
- The theme will still function with static images
- Standard hero backgrounds will be shown

## Compression Tips

Use tools like HandBrake or FFmpeg to optimize:
```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec none -b:v 2M -vf scale=1920:1080 -preset slow output.mp4
```

This ensures good quality while maintaining reasonable file sizes for web delivery.
