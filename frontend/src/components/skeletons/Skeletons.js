import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import './skeletons.css';


export const PostSkeleton = ()=>{
    return(
        // <SkeletonTheme baseColor='#f0f2f5' hightlightColor='#444'>
            <div className='post-skeleton-container'>
                <div className='skeleton-post-top'>
                    <Skeleton height={50} width={50} circle={true} />
                    <Skeleton height={50} width={80} />
                </div>
                <div className='skeleton-post-middle'>
                    <Skeleton height={200} />
                </div>
                <div className='skeleton-post-stats'>
                    <Skeleton height={30} width={30} circle={true} />
                    <Skeleton height={30} width={100} />
                </div>
                <div className='skeleton-post-bottom'>
                    <Skeleton height={60} width={130} />
                    <Skeleton height={60} width={130} />
                </div>
            </div>
        // </SkeletonTheme>
    );
}



export const EditProfileSkeleton = ()=>{
    return(
        <div className='edit-profile-skeleton-container'>
            <div className='edit-profile-cover-skeleton'>
                <Skeleton height={200} borderRadius={10} />
            </div>
            <div className='edit-profile-profile-skeleton'>
                <Skeleton height={300} borderRadius={10} />
            </div>
            <div className='edit-profile-input-skeleton'>
                <Skeleton height={45} borderRadius={20} />
            </div>
            <div className='edit-profile-input-skeleton'>
                <Skeleton height={45} borderRadius={25} />
            </div>
            <div className='edit-profile-textarea-skeleton'>
                <Skeleton height={100} borderRadius={10} />
            </div>
            <div className='edit-profile-addsocial-skeleton'>
                <Skeleton height={40} width={190} />
            </div>
            <div className='edit-profile-save-skeleton'>
                <Skeleton height={39} />
            </div>
        </div>
    );
}






export const ProfileSkeleton = ()=>{
    return(
        <div className='profile-skeleton-container'>
            <div className='profile-cover-skeleton'>
                <Skeleton height='100%' borderRadius={10} />
            </div>
            <div className='profile-short-info-skeleton'>
                <div className='profile-photo-skeleton'>
                    <Skeleton height='100%' borderRadius='50%' />
                </div>
                <div className='profile-name-skeleton'>
                    <Skeleton height='100%' />
                </div>
                <div className='profile-btn-skeleton'>
                    <Skeleton height='100%' />
                </div>
            </div>
            <div className='profile-tabs-skeleton'>
                <div>
                    <Skeleton height='100%' />
                </div>
                <div>
                    <Skeleton height='100%' />
                </div>
                <div>
                    <Skeleton height='100%' />
                </div>
                <div>
                    <Skeleton height='100%' />
                </div>
            </div>
        </div>
    );
}